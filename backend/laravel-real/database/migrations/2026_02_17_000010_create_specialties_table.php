<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specialties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('specialties')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('specialty_id')->nullable()->after('created_by')->constrained('specialties')->nullOnDelete();
            $table->foreignId('subspecialty_id')->nullable()->after('specialty_id')->constrained('specialties')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
            $table->dropForeign(['subspecialty_id']);
            $table->dropColumn(['specialty_id','subspecialty_id']);
        });
        Schema::dropIfExists('specialties');
    }
};