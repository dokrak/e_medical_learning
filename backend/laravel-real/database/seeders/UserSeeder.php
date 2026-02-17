<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // create roles (requires spatie package)
        try { Role::firstOrCreate(['name' => 'admin']); Role::firstOrCreate(['name' => 'clinician']); Role::firstOrCreate(['name' => 'student']); Role::firstOrCreate(['name' => 'moderator']); } catch (\Throwable $e) {}

        $admin = User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin User',
            'password' => Hash::make('password')
        ]);
        $clin = User::firstOrCreate(['email' => 'clinician@example.com'], [
            'name' => 'Clinician',
            'password' => Hash::make('password')
        ]);
        $student = User::firstOrCreate(['email' => 'student@example.com'], [
            'name' => 'Student',
            'password' => Hash::make('password')
        ]);

        try { $admin->assignRole('admin'); $clin->assignRole('clinician'); $student->assignRole('student'); } catch (\Throwable $e) {}
    }
}
