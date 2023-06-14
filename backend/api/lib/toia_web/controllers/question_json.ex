defmodule ToiaWeb.QuestionJSON do
  alias Toia.Questions.Question

  @doc """
  Renders a list of questions.
  """
  def index(%{questions: questions}) do
    %{data: for(question <- questions, do: data(question))}
  end

  @doc """
  Renders a single question.
  """
  def show(%{question: question}) do
    %{data: data(question)}
  end

  defp data(%Question{} = question) do
    %{
      id: question.id,
      question: question.question,
      suggested_type: question.suggested_type,
      onboarding: question.onboarding,
      priority: question.priority,
      trigger_suggester: question.trigger_suggester
    }
  end

  defp data(%{type: _, id_video: _} = question) do
    %{
      id: question.id,
      question: question.question,
      suggested_type: question.suggested_type,
      onboarding: question.onboarding,
      priority: question.priority,
      trigger_suggester: question.trigger_suggester,
      type: question.type,
      id_video: question.id_video
    }
  end

  defp data(%{pending: _} = question) do
    %{
      id: question.id,
      question: question.question,
      suggested_type: question.suggested_type,
      onboarding: question.onboarding,
      priority: question.priority,
      trigger_suggester: question.trigger_suggester,
      pending: question.pending
    }
  end
end
