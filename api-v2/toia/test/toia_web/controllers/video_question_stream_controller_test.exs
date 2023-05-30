defmodule ToiaWeb.VideoQuestionStreamControllerTest do
  use ToiaWeb.ConnCase

  import Toia.VideosQuestionsStreamsFixtures

  alias Toia.VideosQuestionsStreams.VideoQuestionStream

  @create_attrs %{
    ada_search: "some ada_search",
    type: :filler
  }
  @update_attrs %{
    ada_search: "some updated ada_search",
    type: :greeting
  }
  @invalid_attrs %{ada_search: nil, type: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all videos_questions_streams", %{conn: conn} do
      conn = get(conn, ~p"/api/videos_questions_streams")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create video_question_stream" do
    test "renders video_question_stream when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/videos_questions_streams", video_question_stream: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/videos_questions_streams/#{id}")

      assert %{
               "id" => ^id,
               "ada_search" => "some ada_search",
               "type" => "filler"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/videos_questions_streams", video_question_stream: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update video_question_stream" do
    setup [:create_video_question_stream]

    test "renders video_question_stream when data is valid", %{conn: conn, video_question_stream: %VideoQuestionStream{id: id} = video_question_stream} do
      conn = put(conn, ~p"/api/videos_questions_streams/#{video_question_stream}", video_question_stream: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/videos_questions_streams/#{id}")

      assert %{
               "id" => ^id,
               "ada_search" => "some updated ada_search",
               "type" => "greeting"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, video_question_stream: video_question_stream} do
      conn = put(conn, ~p"/api/videos_questions_streams/#{video_question_stream}", video_question_stream: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete video_question_stream" do
    setup [:create_video_question_stream]

    test "deletes chosen video_question_stream", %{conn: conn, video_question_stream: video_question_stream} do
      conn = delete(conn, ~p"/api/videos_questions_streams/#{video_question_stream}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/videos_questions_streams/#{video_question_stream}")
      end
    end
  end

  defp create_video_question_stream(_) do
    video_question_stream = video_question_stream_fixture()
    %{video_question_stream: video_question_stream}
  end
end
