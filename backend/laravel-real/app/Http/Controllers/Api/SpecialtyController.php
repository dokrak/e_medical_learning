<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SpecialtyController extends Controller
{
    protected function checkAdmin(Request $request) {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
    }

    public function index(Request $request)
    {
        $adminCheck = $this->checkAdmin($request);
        if ($adminCheck) return $adminCheck;
        return response()->json(Specialty::all());
    }

    public function publicIndex()
    {
        return response()->json(Specialty::all());
    }

    public function store(Request $request)
    {
        $adminCheck = $this->checkAdmin($request);
        if ($adminCheck) return $adminCheck;
        $data = $request->validate([
            'name' => 'required|string',
            'subs' => 'nullable|array',
        ]);
        $specialty = new Specialty();
        $specialty->id = (string) Str::uuid();
        $specialty->name = $data['name'];
        $specialty->subspecialties = $data['subs'] ? array_map('trim', $data['subs']) : [];
        $specialty->save();
        return response()->json($specialty, 201);
    }

    public function update(Request $request, $id)
    {
        $adminCheck = $this->checkAdmin($request);
        if ($adminCheck) return $adminCheck;
        $data = $request->validate([
            'name' => 'required|string',
            'subs' => 'nullable|array',
        ]);
        $specialty = Specialty::findOrFail($id);
        $specialty->name = $data['name'];
        $specialty->subspecialties = $data['subs'] ? array_map('trim', $data['subs']) : [];
        $specialty->save();
        return response()->json($specialty);
    }

    public function destroy(Request $request, $id)
    {
        $adminCheck = $this->checkAdmin($request);
        if ($adminCheck) return $adminCheck;
        $specialty = Specialty::findOrFail($id);
        $specialty->delete();
        return response()->json(['success' => true]);
    }
}
