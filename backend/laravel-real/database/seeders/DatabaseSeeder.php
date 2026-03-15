<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Specialty;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ---------- Default Users ----------
        $users = [
            ['name' => 'Admin User',      'email' => 'admin@example.com',      'password' => 'password', 'role' => 'admin'],
            ['name' => 'Clinician',        'email' => 'clinician@example.com',  'password' => 'password', 'role' => 'clinician'],
            ['name' => 'Student',          'email' => 'student@example.com',    'password' => 'password', 'role' => 'student'],
            ['name' => 'Clinician One',    'email' => 'clinician1@example.com', 'password' => 'password', 'role' => 'clinician'],
            ['name' => 'Clinician Two',    'email' => 'clinician2@example.com', 'password' => 'password', 'role' => 'clinician'],
            ['name' => 'Moderator',        'email' => 'moderator@example.com',  'password' => 'password', 'role' => 'moderator'],
        ];
        foreach ($users as $u) {
            User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make($u['password']),
                'role' => $u['role'],
            ]);
        }

        // ---------- Specialties ----------
        $specialtiesPath = base_path('../mock-api/data/specialties.json');
        if (file_exists($specialtiesPath)) {
            $specialties = json_decode(file_get_contents($specialtiesPath), true);
            foreach ($specialties as $s) {
                Specialty::create([
                    'id' => $s['id'],
                    'name' => $s['name'],
                    'subspecialties' => $s['subspecialties'] ?? [],
                ]);
            }
        }
    }
}
