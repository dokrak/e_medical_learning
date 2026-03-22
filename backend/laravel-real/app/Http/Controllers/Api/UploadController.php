<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/upload — upload an image file, auto-resize & compress, return its public URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,jpg,png,gif,webp,heic,heif|max:10240',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());

        // Process the image: resize if too large, compress to reduce file size
        $maxWidth = 1920;
        $maxHeight = 1920;
        $jpegQuality = 85;

        $processedContent = $this->processImage($file->getRealPath(), $ext, $maxWidth, $maxHeight, $jpegQuality);

        if ($processedContent !== null) {
            // Save the processed (compressed) image as JPEG
            $filename = Str::uuid() . '.jpg';
            $path = 'uploads/' . $filename;
            Storage::disk('public')->put($path, $processedContent);
        } else {
            // Fallback: store original if processing fails (e.g. GIF animations)
            $filename = Str::uuid() . '.' . $ext;
            $path = $file->storeAs('uploads', $filename, 'public');
        }

        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->json([
                'message' => 'File storage failed — the server cannot write to the uploads directory.',
            ], 500);
        }

        $url = '/api/files/' . $path;
        $finalSize = Storage::disk('public')->size($path);

        return response()->json([
            'url' => $url,
            'originalSize' => $file->getSize(),
            'finalSize' => $finalSize,
        ]);
    }

    /**
     * Resize and compress an image using GD. Returns processed image content or null on failure.
     */
    private function processImage(string $sourcePath, string $ext, int $maxW, int $maxH, int $quality): ?string
    {
        // Skip GIF to preserve animations
        if ($ext === 'gif') {
            return null;
        }

        $source = match ($ext) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($sourcePath),
            'png' => @imagecreatefrompng($sourcePath),
            'webp' => @imagecreatefromwebp($sourcePath),
            default => null,
        };

        if (!$source) {
            return null;
        }

        $origW = imagesx($source);
        $origH = imagesy($source);

        // Calculate new dimensions maintaining aspect ratio
        $newW = $origW;
        $newH = $origH;

        if ($origW > $maxW || $origH > $maxH) {
            $ratio = min($maxW / $origW, $maxH / $origH);
            $newW = (int) round($origW * $ratio);
            $newH = (int) round($origH * $ratio);
        }

        // Create resized image
        $resized = imagecreatetruecolor($newW, $newH);

        // Preserve transparency for PNG → fill white background before converting to JPEG
        imagefill($resized, 0, 0, imagecolorallocate($resized, 255, 255, 255));

        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        imagedestroy($source);

        // Output as JPEG to memory
        ob_start();
        imagejpeg($resized, null, $quality);
        $content = ob_get_clean();
        imagedestroy($resized);

        return $content ?: null;
    }

    /**
     * GET /api/files/{path} — serve an uploaded file through Laravel.
     */
    public function serve($path)
    {
        // Prevent directory traversal
        $path = str_replace('..', '', $path);

        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('public')->path($path);
        $mimeType = Storage::disk('public')->mimeType($path);

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
