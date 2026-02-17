<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->integer('attempts')->default(0);
            $table->integer('corrects')->default(0);
            $table->decimal('difficulty_estimate', 5, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('entity');
            $table->unsignedBigInteger('entity_id');
            $table->string('action');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->json('details')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_metadata', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->boolean('consent_obtained')->default(false);
            $table->boolean('deidentified')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_metadata');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('question_stats');
    }
};
