<?php

namespace App\Http\Controllers;

use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpecialtyController extends Controller
{
    public function index()
    {
        return Specialty::with('children')->whereNull('parent_id')->orderBy('name')->get();
    }

    public function adminCreateSpecialty(Request $request)
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('specialties', 'name')->where(fn ($q) => $q->whereNull('parent_id')),
            ],
        ]);

        $specialty = Specialty::create([
            'name' => trim($data['name']),
            'parent_id' => null,
        ]);

        return response()->json($specialty, 201);
    }

    public function adminCreateSubspecialty(Request $request, int $parentId)
    {
        $parent = Specialty::whereNull('parent_id')->find($parentId);
        if (!$parent) {
            return response()->json(['error' => 'parent specialty not found'], 404);
        }

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('specialties', 'name')->where(fn ($q) => $q->where('parent_id', $parent->id)),
            ],
        ]);

        $sub = Specialty::create([
            'name' => trim($data['name']),
            'parent_id' => $parent->id,
        ]);

        return response()->json($sub, 201);
    }

    public function adminDeleteSpecialty(int $id)
    {
        $specialty = Specialty::withCount('children')->find($id);
        if (!$specialty) {
            return response()->json(['error' => 'specialty not found'], 404);
        }

        if ($specialty->parent_id === null && $specialty->children_count > 0) {
            return response()->json(['error' => 'cannot delete main specialty with subspecialties'], 409);
        }

        $specialty->delete();
        return response()->json(['ok' => true]);
    }
}
