defmodule ToiaWeb.QuestionSuggestionController do
  use ToiaWeb, :controller

  alias Toia.QuestionSuggestions
  alias Toia.QuestionSuggestions.QuestionSuggestion

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    question_suggestions = QuestionSuggestions.list_question_suggestions()
    render(conn, :index, question_suggestions: question_suggestions)
  end

  def create(conn, %{"question_suggestion" => question_suggestion_params}) do
    with {:ok, %QuestionSuggestion{} = question_suggestion} <- QuestionSuggestions.create_question_suggestion(question_suggestion_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/question_suggestions/#{question_suggestion}")
      |> render(:show, question_suggestion: question_suggestion)
    end
  end

  def show(conn, %{"id" => id}) do
    question_suggestion = QuestionSuggestions.get_question_suggestion!(id)
    render(conn, :show, question_suggestion: question_suggestion)
  end

  def update(conn, %{"id" => id, "question_suggestion" => question_suggestion_params}) do
    question_suggestion = QuestionSuggestions.get_question_suggestion!(id)

    with {:ok, %QuestionSuggestion{} = question_suggestion} <- QuestionSuggestions.update_question_suggestion(question_suggestion, question_suggestion_params) do
      render(conn, :show, question_suggestion: question_suggestion)
    end
  end

  def delete(conn, %{"id" => id}) do
    question_suggestion = QuestionSuggestions.get_question_suggestion!(id)

    with {:ok, %QuestionSuggestion{}} <- QuestionSuggestions.delete_question_suggestion(question_suggestion) do
      send_resp(conn, :no_content, "")
    end
  end
end
