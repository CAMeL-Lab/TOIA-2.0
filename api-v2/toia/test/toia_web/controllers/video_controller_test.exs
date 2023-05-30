defmodule ToiaWeb.VideoControllerTest do
  use ToiaWeb.ConnCase

  import Toia.VideosFixtures

  alias Toia.Videos.Video

  @create_attrs %{
    answer: "some answer",
    duration_seconds: 42,
    idx: 42,
    language: "some language",
    likes: 42,
    private: true,
    views: 42
  }
  @update_attrs %{
    answer: "some updated answer",
    duration_seconds: 43,
    idx: 43,
    language: "some updated language",
    likes: 43,
    private: false,
    views: 43
  }
  @invalid_attrs %{answer: nil, duration_seconds: nil, idx: nil, language: nil, likes: nil, private: nil, views: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all video", %{conn: conn} do
      conn = get(conn, ~p"/api/video")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create video" do
    test "renders video when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/video", video: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/video/#{id}")

      assert %{
               "id" => ^id,
               "answer" => "some answer",
               "duration_seconds" => 42,
               "idx" => 42,
               "language" => "some language",
               "likes" => 42,
               "private" => true,
               "views" => 42
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/video", video: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update video" do
    setup [:create_video]

    test "renders video when data is valid", %{conn: conn, video: %Video{id: id} = video} do
      conn = put(conn, ~p"/api/video/#{video}", video: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/video/#{id}")

      assert %{
               "id" => ^id,
               "answer" => "some updated answer",
               "duration_seconds" => 43,
               "idx" => 43,
               "language" => "some updated language",
               "likes" => 43,
               "private" => false,
               "views" => 43
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, video: video} do
      conn = put(conn, ~p"/api/video/#{video}", video: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete video" do
    setup [:create_video]

    test "deletes chosen video", %{conn: conn, video: video} do
      conn = delete(conn, ~p"/api/video/#{video}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/video/#{video}")
      end
    end
  end

  defp create_video(_) do
    video = video_fixture()
    %{video: video}
  end
end
