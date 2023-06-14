defmodule Toia.QuestionSuggestionsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.QuestionSuggestions` context.
  """

  @doc """
  Generate a question_suggestion.
  """
  def question_suggestion_fixture(attrs \\ %{}) do
    {:ok, question_suggestion} =
      attrs
      |> Enum.into(%{
        isPending: true
      })
      |> Toia.QuestionSuggestions.create_question_suggestion()

    question_suggestion
  end
end
