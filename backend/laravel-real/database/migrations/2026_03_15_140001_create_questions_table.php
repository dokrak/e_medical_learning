<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title')->default('(no title)');
            $table->text('stem')->nullable();
            $table->text('body')->nullable();
            $table->text('answer_explanation')->nullable();
            $table->integer('difficulty')->default(3);
            $table->string('answer')->nullable();
            $table->json('choices')->nullable();
            $table->json('references')->nullable();
            $table->json('images')->nullable();
            $table->string('specialty_id')->nullable();
            $table->string('subspecialty_id')->nullable();
            $table->string('status')->default('pending');
            $table->text('moderation_feedback')->nullable();
            $table->unsignedBigInteger('author_id');
            $table->timestamps();

            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
