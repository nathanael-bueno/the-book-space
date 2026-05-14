<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadImageRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(UploadImageRequest $request): JsonResponse
    {
        $file = $request->file('image');
        $context = $request->input('context');

        $path = sprintf('%s/%s.%s', $context, Str::uuid(), $file->extension());

        Storage::disk('r2')->put($path, file_get_contents($file->getRealPath()), 'public');

        $url = rtrim((string) config('filesystems.disks.r2.public_url'), '/') . '/' . $path;

        return response()->json(['url' => $url], 201);
    }
}
