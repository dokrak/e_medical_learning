<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialty;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [

            'Internal Medicine' => [
                'Cardiology',
                'Interventional Cardiology',
                'Electrophysiology',
                'Endocrinology',
                'Gastroenterology',
                'Hepatology',
                'Pulmonology',
                'Sleep Medicine',
                'Nephrology',
                'Rheumatology',
                'Infectious Diseases',
                'Hematology',
                'Oncology',
                'Geriatrics',
                'Critical Care Medicine',
                'Palliative Medicine',
                'Allergy & Immunology'
            ],

            'Surgery' => [
                'General Surgery',
                'Colorectal Surgery',
                'Hepatobiliary Surgery',
                'Breast Surgery',
                'Trauma Surgery',
                'Cardiothoracic Surgery',
                'Vascular Surgery',
                'Neurosurgery',
                'Orthopedic Surgery',
                'Spine Surgery',
                'Plastic Surgery',
                'Urology',
                'Pediatric Surgery',
                'Transplant Surgery'
            ],

            'Pediatrics' => [
                'Neonatology',
                'Pediatric Cardiology',
                'Pediatric Neurology',
                'Pediatric Endocrinology',
                'Pediatric Gastroenterology',
                'Pediatric Hematology-Oncology',
                'Pediatric Critical Care'
            ],

            'Obstetrics & Gynecology' => [
                'Maternal-Fetal Medicine',
                'Reproductive Endocrinology',
                'Gynecologic Oncology',
                'Urogynecology'
            ],

            'Radiology' => [
                'Diagnostic Radiology',
                'Interventional Radiology',
                'Neuroradiology',
                'Musculoskeletal Radiology',
                'Pediatric Radiology',
                'Nuclear Medicine'
            ],

            'Psychiatry' => [
                'Child & Adolescent Psychiatry',
                'Geriatric Psychiatry',
                'Forensic Psychiatry',
                'Addiction Psychiatry'
            ],

            'Anesthesiology' => [
                'Cardiac Anesthesia',
                'Neuroanesthesia',
                'Pediatric Anesthesia',
                'Pain Medicine'
            ],

            'Emergency Medicine' => [],
            'Family Medicine' => [],
            'Neurology' => [],
            'Dermatology' => [],
            'Pathology' => [],
            'Ophthalmology' => [],
            'Otolaryngology (ENT)' => [],
            'Physical Medicine & Rehabilitation' => [],
            'Public Health' => [],
            'Medical Genetics' => [],
        ];

        foreach ($specialties as $main => $subs) {
            $parent = Specialty::firstOrCreate(['name' => $main]);

            foreach ($subs as $sub) {
                Specialty::firstOrCreate([
                    'name' => $sub,
                    'parent_id' => $parent->id
                ]);
            }
        }
    }
}