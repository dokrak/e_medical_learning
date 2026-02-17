<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;
use App\Models\User;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $clin = User::where('email','clinician@example.com')->first();
        if (!$clin) return;

        Question::firstOrCreate([
            'title' => 'Chest X-ray: consolidation',
        ], [
            'stem' => 'A 65-year-old with fever and cough. See image.',
            'body' => 'Examine the chest X-ray and choose the most likely diagnosis.',
            'difficulty' => 3,
            'choices' => ['Lobar pneumonia','Bronchiectasis','Pulmonary embolism','Interstitial pneumonia','Pleural effusion'],
            'answer' => 'Lobar pneumonia',
            'references' => ['Harrison 20th ed. Chapter X'],
            'status' => 'approved',
            'author_id' => $clin->id
        ]);

        Question::firstOrCreate([
            'title' => 'ECG: STEMI',
        ], [
            'stem' => 'A 50-year-old with chest pain. Interpret ECG.',
            'body' => 'Which lead shows ST-elevation?',
            'difficulty' => 4,
            'choices' => ['Lead I-II-III','Lead V2-V4','Lead V5-V6','Lead aVR','Diffuse ST depression'],
            'answer' => 'Lead V2-V4',
            'references' => ['Cardiology Textbook'],
            'status' => 'approved',
            'author_id' => $clin->id
        ]);

        Question::firstOrCreate([
            'title' => 'Skin lesion',
        ], [
            'stem' => 'A 30-year-old with pigmented lesion. Upload from clinic.',
            'body' => 'Best next step?',
            'difficulty' => 2,
            'choices' => ['Topical steroid','Cryotherapy','Excisional biopsy','Observation','Punch biopsy'],
            'answer' => 'Excisional biopsy',
            'references' => ['Dermatology Guidelines'],
            'status' => 'pending',
            'author_id' => $clin->id
        ]);
    }
}
