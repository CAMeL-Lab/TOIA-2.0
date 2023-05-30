defmodule ToiaWeb.PlayerFeedbackControllerTest do
  use ToiaWeb.ConnCase

  import Toia.PlayerFeedbacksFixtures

  alias Toia.PlayerFeedbacks.PlayerFeedback

  @create_attrs %{
    question: "some question",
    rating: 42,
    video_id: "some video_id"
  }
  @update_attrs %{
    question: "some updated question",
    rating: 43,
    video_id: "some updated video_id"
  }
  @invalid_attrs %{question: nil, rating: nil, video_id: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all player_feedback", %{conn: conn} do
      conn = get(conn, ~p"/api/player_feedback")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create player_feedback" do
    test "renders player_feedback when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/player_feedback", player_feedback: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/player_feedback/#{id}")

      assert %{
               "id" => ^id,
               "question" => "some question",
               "rating" => 42,
               "video_id" => "some video_id"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/player_feedback", player_feedback: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update player_feedback" do
    setup [:create_player_feedback]

    test "renders player_feedback when data is valid", %{conn: conn, player_feedback: %PlayerFeedback{id: id} = player_feedback} do
      conn = put(conn, ~p"/api/player_feedback/#{player_feedback}", player_feedback: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/player_feedback/#{id}")

      assert %{
               "id" => ^id,
               "question" => "some updated question",
               "rating" => 43,
               "video_id" => "some updated video_id"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, player_feedback: player_feedback} do
      conn = put(conn, ~p"/api/player_feedback/#{player_feedback}", player_feedback: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete player_feedback" do
    setup [:create_player_feedback]

    test "deletes chosen player_feedback", %{conn: conn, player_feedback: player_feedback} do
      conn = delete(conn, ~p"/api/player_feedback/#{player_feedback}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/player_feedback/#{player_feedback}")
      end
    end
  end

  defp create_player_feedback(_) do
    player_feedback = player_feedback_fixture()
    %{player_feedback: player_feedback}
  end
end
