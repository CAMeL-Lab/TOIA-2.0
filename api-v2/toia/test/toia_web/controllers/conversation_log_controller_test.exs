defmodule ToiaWeb.ConversationLogControllerTest do
  use ToiaWeb.ConnCase

  import Toia.ConversationsLogsFixtures

  alias Toia.ConversationsLogs.ConversationLog

  @create_attrs %{
    ada_similarity_score: 120.5,
    filler: true,
    interactor_id: 42,
    mode: "some mode",
    question_asked: "some question_asked",
    timestamp: 42,
    video_played: "some video_played"
  }
  @update_attrs %{
    ada_similarity_score: 456.7,
    filler: false,
    interactor_id: 43,
    mode: "some updated mode",
    question_asked: "some updated question_asked",
    timestamp: 43,
    video_played: "some updated video_played"
  }
  @invalid_attrs %{ada_similarity_score: nil, filler: nil, interactor_id: nil, mode: nil, question_asked: nil, timestamp: nil, video_played: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all conversations_log", %{conn: conn} do
      conn = get(conn, ~p"/api/conversations_log")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create conversation_log" do
    test "renders conversation_log when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/conversations_log", conversation_log: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/conversations_log/#{id}")

      assert %{
               "id" => ^id,
               "ada_similarity_score" => 120.5,
               "filler" => true,
               "interactor_id" => 42,
               "mode" => "some mode",
               "question_asked" => "some question_asked",
               "timestamp" => 42,
               "video_played" => "some video_played"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/conversations_log", conversation_log: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update conversation_log" do
    setup [:create_conversation_log]

    test "renders conversation_log when data is valid", %{conn: conn, conversation_log: %ConversationLog{id: id} = conversation_log} do
      conn = put(conn, ~p"/api/conversations_log/#{conversation_log}", conversation_log: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/conversations_log/#{id}")

      assert %{
               "id" => ^id,
               "ada_similarity_score" => 456.7,
               "filler" => false,
               "interactor_id" => 43,
               "mode" => "some updated mode",
               "question_asked" => "some updated question_asked",
               "timestamp" => 43,
               "video_played" => "some updated video_played"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, conversation_log: conversation_log} do
      conn = put(conn, ~p"/api/conversations_log/#{conversation_log}", conversation_log: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete conversation_log" do
    setup [:create_conversation_log]

    test "deletes chosen conversation_log", %{conn: conn, conversation_log: conversation_log} do
      conn = delete(conn, ~p"/api/conversations_log/#{conversation_log}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/conversations_log/#{conversation_log}")
      end
    end
  end

  defp create_conversation_log(_) do
    conversation_log = conversation_log_fixture()
    %{conversation_log: conversation_log}
  end
end
