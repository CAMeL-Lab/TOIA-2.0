defmodule ToiaWeb.TrackerControllerTest do
  use ToiaWeb.ConnCase

  import Toia.TrackersFixtures

  alias Toia.Trackers.Tracker

  @create_attrs %{
    activity: "some activity",
    end_time: 42,
    old_video_id: "some old_video_id",
    start_time: 42,
    track_id: 42,
    video_id: "some video_id"
  }
  @update_attrs %{
    activity: "some updated activity",
    end_time: 43,
    old_video_id: "some updated old_video_id",
    start_time: 43,
    track_id: 43,
    video_id: "some updated video_id"
  }
  @invalid_attrs %{activity: nil, end_time: nil, old_video_id: nil, start_time: nil, track_id: nil, video_id: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all tracker", %{conn: conn} do
      conn = get(conn, ~p"/api/tracker")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create tracker" do
    test "renders tracker when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/tracker", tracker: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/tracker/#{id}")

      assert %{
               "id" => ^id,
               "activity" => "some activity",
               "end_time" => 42,
               "old_video_id" => "some old_video_id",
               "start_time" => 42,
               "track_id" => 42,
               "video_id" => "some video_id"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/tracker", tracker: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update tracker" do
    setup [:create_tracker]

    test "renders tracker when data is valid", %{conn: conn, tracker: %Tracker{id: id} = tracker} do
      conn = put(conn, ~p"/api/tracker/#{tracker}", tracker: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/tracker/#{id}")

      assert %{
               "id" => ^id,
               "activity" => "some updated activity",
               "end_time" => 43,
               "old_video_id" => "some updated old_video_id",
               "start_time" => 43,
               "track_id" => 43,
               "video_id" => "some updated video_id"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, tracker: tracker} do
      conn = put(conn, ~p"/api/tracker/#{tracker}", tracker: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete tracker" do
    setup [:create_tracker]

    test "deletes chosen tracker", %{conn: conn, tracker: tracker} do
      conn = delete(conn, ~p"/api/tracker/#{tracker}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/tracker/#{tracker}")
      end
    end
  end

  defp create_tracker(_) do
    tracker = tracker_fixture()
    %{tracker: tracker}
  end
end
