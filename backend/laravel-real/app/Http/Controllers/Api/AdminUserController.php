<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::all(['id', 'name', 'email', 'role'])
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string',
            'role' => 'required|string|in:admin,clinician,student,moderator',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|string|in:admin,clinician,student,moderator',
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('password')) $user->password = Hash::make($request->password);
        if ($request->has('role')) $user->role = $request->role;
        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['id' => $user->id, 'message' => 'user deleted']);
    }
}
