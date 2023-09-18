defmodule ToiaWeb.QuestionSuggestionJSON do

  @doc """
  Renders a list of question_suggestions.
  """
  def index(%{question_suggestions: question_suggestions}) do
    for(question_suggestion <- question_suggestions, do: data(question_suggestion))
  end

  @doc """
  Renders a single question_suggestion.
  """
  def show(%{question_suggestion: question_suggestion}) do
    data(question_suggestion)
  end

  defp data(%{isPending: _, onboarding: _, trigger_suggester: _} = question_suggestion) do
    %{
      id_question: question_suggestion.id_question,
      question: question_suggestion.question,
      type: question_suggestion.type,
      priority: question_suggestion.priority,
      isPending: question_suggestion.isPending,
      onboarding: question_suggestion.onboarding,
      trigger_suggester: question_suggestion.trigger_suggester
    }
  end

  defp data(question_suggestion) do
    %{
      id_question: question_suggestion.id_question,
      question: question_suggestion.question,
      type: question_suggestion.type,
      priority: question_suggestion.priority
    }
  end
end
