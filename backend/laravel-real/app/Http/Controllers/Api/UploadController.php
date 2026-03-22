<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/upload — upload an image file, return its public URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,jpg,png,gif,webp,heic,heif|max:10240',
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $filename, 'public');

        if (!$path) {
            return response()->json([
                'message' => 'File storage failed — the server cannot write to the uploads directory.',
            ], 500);
        }

        // Return API-served URL so it works through reverse proxies/gateways
        $url = '/api/files/' . $path;

        return response()->json(['url' => $url]);
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
