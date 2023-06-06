defmodule ToiaWeb.QuestionSuggestionController do
  use ToiaWeb, :controller

  import Ecto.Query, warn: false
  alias Toia.Repo
  alias Toia.QuestionSuggestions
  alias Toia.QuestionSuggestions.QuestionSuggestion
  alias Toia.Questions
  alias Toia.Questions.Question

  alias Toia.ToiaUser

  action_fallback(ToiaWeb.FallbackController)

  def index(
        %{query_params: %{"limit" => limitStr}, assigns: %{current_user: user}} = conn,
        _params
      ) do
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

  def create(%{assigns: %{current_user: user}} = conn, %{"question" => question} = _params) do
    suggestion = %{question: question, toia_id: user.id}

    with {:ok, question_suggestion} <- QuestionSuggestions.create_question_suggestion(suggestion) do
      conn
      |> put_status(:created)
      |> render(:show, question_suggestion: question_suggestion)
    end
  end

  def show(conn, %{"id" => id}) do
    question_suggestion = QuestionSuggestions.get_question_suggestion!(id)
    render(conn, :show, question_suggestion: question_suggestion)
  end

  def update(%{assigns: %{current_user: user}} = conn, %{
        "id" => idStr,
        "new_value" => new_question
      }) do
    {id, _} = Integer.parse(idStr)
    old_suggestion = Repo.get_by!(QuestionSuggestion, id_question: id, toia_id: user.id)

    with {:ok, question_suggestion} <-
           QuestionSuggestions.update_suggestion(old_suggestion, new_question) do
      conn
      |> put_status(:ok)
      |> render(:show, question_suggestion: question_suggestion)
    end
  end

  def update(%{assigns: %{current_user: user}} = conn, %{
        "id" => idStr,
        "isPending" => isPendingStr
      }) do
    {id, _} = Integer.parse(idStr)
    old_suggestion = Repo.get_by!(QuestionSuggestion, id_question: id, toia_id: user.id)
    isPending = isPendingStr == "true" or isPendingStr == "1" or isPendingStr == true

    question_suggestion =
      QuestionSuggestions.update_question_suggestion(
        old_suggestion,
        %{isPending: isPending, id_question: id, toia_id: user.id}
      )

    question = Repo.get!(Question, id)

    conn
    |> put_status(:ok)
    |> render(:show,
      question_suggestion: %{
        id_question: question.id,
        question: question.question,
        type: question.suggested_type,
        priority: question.priority
      }
    )
  end

  def delete(%{assigns: %{current_user: user}} = conn, %{"id" => idStr}) do
    {id, _} = Integer.parse(idStr)

    %QuestionSuggestion{id_question: id, toia_id: user.id}
    |> Toia.Repo.delete()

    send_resp(conn, :no_content, "")
  end

  def latest(%{assigns: %{current_user: user}} = conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{question_suggestion: QuestionSuggestions.get_latest_suggestion(user.id)})
  end
end
