<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Question;

class ScanPhi extends Command
{
    protected $signature = 'scan:phi {questionId}';
    protected $description = 'Simulate PHI scan for a question (placeholder for OCR pipeline)';

    public function handle()
    {
        $id = $this->argument('questionId');
        $q = Question::find($id);
        if (!$q) { $this->error('Question not found'); return 1; }
        // placeholder: randomly mark as de-identified or flag
        $flag = rand(0,3) === 0; // 25% chance flagged
        $q->patientMetadata()->update(['deidentified' => !$flag]);
        $this->info('Scan complete. flagged=' . ($flag ? 'true' : 'false'));
        return 0;
    }
}
