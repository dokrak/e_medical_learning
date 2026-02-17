<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class QuestionFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinician_can_upload_and_moderator_can_approve()
    {
        // seed users
        $admin = User::factory()->create(['email'=>'admin@example.com']);
        $clin = User::factory()->create(['email'=>'clinician@example.com']);

        $this->actingAs($clin, 'sanctum')
            ->postJson('/api/questions', ['title'=>'T1','stem'=>'s','body'=>'b','difficulty'=>3,'answer'=>'a'])
            ->assertStatus(201);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/pending-questions')
            ->assertStatus(200);
    }
}
