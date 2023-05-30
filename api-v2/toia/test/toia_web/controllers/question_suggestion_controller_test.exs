defmodule ToiaWeb.QuestionSuggestionControllerTest do
  use ToiaWeb.ConnCase

  import Toia.QuestionSuggestionsFixtures

  alias Toia.QuestionSuggestions.QuestionSuggestion

  @create_attrs %{
    isPending: true
  }
  @update_attrs %{
    isPending: false
  }
  @invalid_attrs %{isPending: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all question_suggestions", %{conn: conn} do
      conn = get(conn, ~p"/api/question_suggestions")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create question_suggestion" do
    test "renders question_suggestion when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/question_suggestions", question_suggestion: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/question_suggestions/#{id}")

      assert %{
               "id" => ^id,
               "isPending" => true
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/question_suggestions", question_suggestion: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update question_suggestion" do
    setup [:create_question_suggestion]

    test "renders question_suggestion when data is valid", %{conn: conn, question_suggestion: %QuestionSuggestion{id: id} = question_suggestion} do
      conn = put(conn, ~p"/api/question_suggestions/#{question_suggestion}", question_suggestion: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/question_suggestions/#{id}")

      assert %{
               "id" => ^id,
               "isPending" => false
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, question_suggestion: question_suggestion} do
      conn = put(conn, ~p"/api/question_suggestions/#{question_suggestion}", question_suggestion: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete question_suggestion" do
    setup [:create_question_suggestion]

    test "deletes chosen question_suggestion", %{conn: conn, question_suggestion: question_suggestion} do
      conn = delete(conn, ~p"/api/question_suggestions/#{question_suggestion}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/question_suggestions/#{question_suggestion}")
      end
    end
  end

  defp create_question_suggestion(_) do
    question_suggestion = question_suggestion_fixture()
    %{question_suggestion: question_suggestion}
  end
end
