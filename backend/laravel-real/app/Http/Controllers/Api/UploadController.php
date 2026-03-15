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
            'file' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $filename, 'public');

        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url]);
    }
}
