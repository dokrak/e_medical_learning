<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request){
        $data = $request->validate([ 'name'=>'required','email'=>'required|email|unique:users','password'=>'required|min:6' ]);
        $user = User::create(['name'=>$data['name'],'email'=>$data['email'],'password'=>Hash::make($data['password'])]);
        return response()->json(['user'=>$user],201);
    }

    public function login(Request $request){
        $creds = $request->validate([ 'email'=>'required|email','password'=>'required' ]);
        $user = User::where('email',$creds['email'])->first();
        if (!$user || !Hash::check($creds['password'],$user->password)) return response()->json(['error'=>'invalid_credentials'],401);
        $token = $user->createToken('api-token')->plainTextToken;
        $payloadUser = $user->toArray();
        // include primary role (if any) for frontend convenience
        try { $payloadUser['role'] = $user->getRoleNames()->first() ?? null; } catch (\Throwable $e) { $payloadUser['role'] = null; }
        return response()->json(['token'=>$token,'user'=>$payloadUser]);
    }

    public function me(Request $request){
        $u = $request->user()->toArray();
        try { $u['role'] = $request->user()->getRoleNames()->first() ?? null; } catch (\Throwable $e) { $u['role'] = null; }
        return response()->json(['user'=>$u]);
    }
}
