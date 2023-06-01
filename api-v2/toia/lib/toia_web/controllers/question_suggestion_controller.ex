defmodule ToiaWeb.QuestionSuggestionController do
  use ToiaWeb, :controller


  import Ecto.Query, warn: false
  alias Toia.Repo
  alias Toia.QuestionSuggestions
  alias Toia.QuestionSuggestions.QuestionSuggestion

  alias Toia.ToiaUser

  action_fallback ToiaWeb.FallbackController

  def index(%{query_params: %{"limit" => limitStr}, assigns: %{current_user: user}} = conn, _params) do
    limit = 10
    case Integer.parse(limitStr) do
      {limitParsed, _} when limitParsed > 0 ->
        limit = limitParsed
      _ ->
        limit = 10
    end
    question_suggestions = QuestionSuggestions.list_question_suggestions(user.id, limit)
    render(conn, :index, question_suggestions: question_suggestions)
  end

  def index(%{assigns: %{current_user: user}} = conn, _params) do
    question_suggestions = QuestionSuggestions.list_question_suggestions(user.id)
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

  def delete(%{assigns: %{current_user: user}} = conn, %{"id" => idStr}) do
    {id, _} = Integer.parse(idStr)
    %QuestionSuggestion{id_question: id, toia_id: user.id}
    |> Toia.Repo.delete()

    send_resp(conn, :no_content, "")
  end
end
