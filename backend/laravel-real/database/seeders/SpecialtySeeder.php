<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialty;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        // major specialties and some common subspecialties
        $ims = Specialty::firstOrCreate(['name'=>'Internal Medicine']);
        Specialty::firstOrCreate(['name'=>'Cardiology','parent_id'=>$ims->id]);
        Specialty::firstOrCreate(['name'=>'Endocrinology','parent_id'=>$ims->id]);
        Specialty::firstOrCreate(['name'=>'Gastroenterology','parent_id'=>$ims->id]);
        Specialty::firstOrCreate(['name'=>'Pulmonology','parent_id'=>$ims->id]);
        Specialty::firstOrCreate(['name'=>'Nephrology','parent_id'=>$ims->id]);
        Specialty::firstOrCreate(['name'=>'Infectious Diseases','parent_id'=>$ims->id]);

        $surg = Specialty::firstOrCreate(['name'=>'Surgery']);
        Specialty::firstOrCreate(['name'=>'General Surgery','parent_id'=>$surg->id]);
        Specialty::firstOrCreate(['name'=>'Orthopedics','parent_id'=>$surg->id]);
        Specialty::firstOrCreate(['name'=>'Neurosurgery','parent_id'=>$surg->id]);

        $peds = Specialty::firstOrCreate(['name'=>'Pediatrics']);
        Specialty::firstOrCreate(['name'=>'Neonatology','parent_id'=>$peds->id]);

        Specialty::firstOrCreate(['name'=>'Emergency Medicine']);
        Specialty::firstOrCreate(['name'=>'Family Medicine']);
        Specialty::firstOrCreate(['name'=>'Psychiatry']);
        Specialty::firstOrCreate(['name'=>'Radiology']);
        Specialty::firstOrCreate(['name'=>'Anesthesiology']);
        Specialty::firstOrCreate(['name'=>'Obstetrics & Gynecology']);
        Specialty::firstOrCreate(['name'=>'Dermatology']);
        Specialty::firstOrCreate(['name'=>'Neurology']);
    }
}
