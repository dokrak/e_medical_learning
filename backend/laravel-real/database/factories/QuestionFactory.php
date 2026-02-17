<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Question;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition()
    {
        return [
            'title' => $this->faker->sentence(6),
            'stem' => $this->faker->paragraph,
            'body' => $this->faker->paragraph,
            'difficulty' => $this->faker->numberBetween(1,5),
            'choices' => [$this->faker->word, $this->faker->word, $this->faker->word, $this->faker->word, $this->faker->word],
            'answer' => $this->faker->randomElement(['a','b','c','d','e']),
            'references' => [$this->faker->sentence],
            'status' => 'approved',
            'author_id' => 1,
        ];
    }
}
