defmodule ToiaWeb.QuestionSuggestionJSON do
  alias Toia.QuestionSuggestions.QuestionSuggestion

  @doc """
  Renders a list of question_suggestions.
  """
  def index(%{question_suggestions: question_suggestions}) do
    %{data: for(question_suggestion <- question_suggestions, do: data(question_suggestion))}
  end

  @doc """
  Renders a single question_suggestion.
  """
  def show(%{question_suggestion: question_suggestion}) do
    %{data: data(question_suggestion)}
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
