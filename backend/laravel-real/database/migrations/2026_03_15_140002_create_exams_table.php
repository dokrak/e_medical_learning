<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title')->default('Exam');
            $table->unsignedBigInteger('created_by');
            $table->json('questions');
            $table->json('specialty')->nullable();
            $table->json('subspecialty')->nullable();
            $table->string('difficulty_level')->nullable();
            $table->json('difficulty_distribution')->nullable();
            $table->string('selection_mode')->default('random');
            $table->integer('passing_score')->default(50);
            $table->float('total_difficulty_score')->nullable();
            $table->float('average_difficulty_score')->nullable();
            $table->string('computed_difficulty_level')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
