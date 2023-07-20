defmodule ToiaWeb.QuestionController do
  use ToiaWeb, :controller

  alias Toia.Questions
  alias Toia.Questions.Question

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    questions = Questions.list_questions()
    render(conn, :index, questions: questions)
  end

  def index_answered(%{assigns: %{current_user: user}} = conn, %{"stream_id" => stream_id}) do
    questions = Questions.get_answered_question(user.id, stream_id)
    render(conn, :index, questions: questions)
  end

  def index_answered(conn, %{"stream_id" => stream_id}) do
    questions = Questions.get_answered_question(-1, stream_id)
    render(conn, :index, questions: questions)
  end

  def index_answered(%{assigns: %{current_user: user}} = conn, _params) do
    questions = Questions.get_answered_question(user.id)
    render(conn, :index, questions: questions)
  end

  def create(conn, %{"question" => question_params}) do
    with {:ok, %Question{} = question} <- Questions.create_question(question_params) do
      conn
      |> put_status(:created)
      |> render(:show, question: question)
    end
  end

  def show(conn, %{"id" => id}) do
    question = Questions.get_question!(id)
    render(conn, :show, question: question)
  end

  def update(conn, %{"id" => id, "question" => question_params}) do
    question = Questions.get_question!(id)

    with {:ok, %Question{} = question} <- Questions.update_question(question, question_params) do
      render(conn, :show, question: question)
    end
  end

  def delete(conn, %{"id" => id}) do
    question = Questions.get_question!(id)

    with {:ok, %Question{}} <- Questions.delete_question(question) do
      send_resp(conn, :no_content, "")
    end
  end
end
