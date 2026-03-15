<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminUserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::all(['id', 'name', 'email', 'role', 'profile_picture', 'hospital', 'province', 'line_id'])
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string',
            'role' => 'required|string|in:admin,clinician,student,moderator,resident,fellow',
            'profile_picture' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'hospital' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'line_id' => 'nullable|string|max:255',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'hospital' => $request->hospital,
            'province' => $request->province,
            'line_id' => $request->line_id,
        ];

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'uploads/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('public')->put($filename, file_get_contents($file));
            $data['profile_picture'] = '/storage/' . $filename;
        }

        $user = User::create($data);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture,
            'hospital' => $user->hospital,
            'province' => $user->province,
            'line_id' => $user->line_id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|string|in:admin,clinician,student,moderator,resident,fellow',
            'profile_picture' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'hospital' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'line_id' => 'nullable|string|max:255',
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('password')) $user->password = Hash::make($request->password);
        if ($request->has('role')) $user->role = $request->role;
        if ($request->has('hospital')) $user->hospital = $request->hospital;
        if ($request->has('province')) $user->province = $request->province;
        if ($request->has('line_id')) $user->line_id = $request->line_id;

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'uploads/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('public')->put($filename, file_get_contents($file));
            $user->profile_picture = '/storage/' . $filename;
        } elseif ($request->has('remove_picture')) {
            $user->profile_picture = null;
        }

        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture,
            'hospital' => $user->hospital,
            'province' => $user->province,
            'line_id' => $user->line_id,
        ]);
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['id' => $user->id, 'message' => 'user deleted']);
    }
}
