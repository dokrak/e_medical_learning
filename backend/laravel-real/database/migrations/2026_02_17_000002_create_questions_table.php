<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('stem')->nullable();
            $table->text('body')->nullable();
            $table->unsignedTinyInteger('difficulty')->default(3);
            $table->text('answer')->nullable();
            $table->json('references')->nullable();
            $table->json('choices')->nullable();
            $table->enum('status', ['pending','approved','rejected'])->default('pending');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
