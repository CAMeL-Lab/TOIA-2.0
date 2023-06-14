defmodule Toia.QuestionsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.Questions` context.
  """

  @doc """
  Generate a question.
  """
  def question_fixture(attrs \\ %{}) do
    {:ok, question} =
      attrs
      |> Enum.into(%{
        onboarding: true,
        priority: 42,
        question: "some question",
        suggested_type: :filler,
        trigger_suggester: true
      })
      |> Toia.Questions.create_question()

    question
  end
end
