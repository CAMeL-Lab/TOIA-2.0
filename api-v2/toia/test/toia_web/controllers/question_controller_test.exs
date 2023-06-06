defmodule ToiaWeb.QuestionControllerTest do
  use ToiaWeb.ConnCase

  import Toia.QuestionsFixtures

  alias Toia.Questions.Question

  @create_attrs %{
    onboarding: true,
    priority: 42,
    question: "some question",
    suggested_type: :filler,
    trigger_suggester: true
  }
  @update_attrs %{
    onboarding: false,
    priority: 43,
    question: "some updated question",
    suggested_type: :greeting,
    trigger_suggester: false
  }
  @invalid_attrs %{
    onboarding: nil,
    priority: nil,
    question: nil,
    suggested_type: nil,
    trigger_suggester: nil
  }

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all questions", %{conn: conn} do
      conn = get(conn, ~p"/api/questions")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create question" do
    test "renders question when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/questions", question: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/questions/#{id}")

      assert %{
               "id" => ^id,
               "onboarding" => true,
               "priority" => 42,
               "question" => "some question",
               "suggested_type" => "filler",
               "trigger_suggester" => true
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/questions", question: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update question" do
    setup [:create_question]

    test "renders question when data is valid", %{
      conn: conn,
      question: %Question{id: id} = question
    } do
      conn = put(conn, ~p"/api/questions/#{question}", question: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/questions/#{id}")

      assert %{
               "id" => ^id,
               "onboarding" => false,
               "priority" => 43,
               "question" => "some updated question",
               "suggested_type" => "greeting",
               "trigger_suggester" => false
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, question: question} do
      conn = put(conn, ~p"/api/questions/#{question}", question: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete question" do
    setup [:create_question]

    test "deletes chosen question", %{conn: conn, question: question} do
      conn = delete(conn, ~p"/api/questions/#{question}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/questions/#{question}")
      end
    end
  end

  defp create_question(_) do
    question = question_fixture()
    %{question: question}
  end
end
