<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->unsignedBigInteger('student_id');
            $table->json('answers');
            $table->integer('score')->default(0);
            $table->boolean('passed')->default(false);
            $table->integer('total')->default(0);
            $table->integer('correct')->default(0);
            $table->integer('passing_score')->default(50);
            $table->timestamp('taken_at')->nullable();
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_exams');
    }
};
