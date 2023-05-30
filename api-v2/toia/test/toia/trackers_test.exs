defmodule Toia.TrackersTest do
  use Toia.DataCase

  alias Toia.Trackers

  describe "tracker" do
    alias Toia.Trackers.Tracker

    import Toia.TrackersFixtures

    @invalid_attrs %{activity: nil, end_time: nil, old_video_id: nil, start_time: nil, track_id: nil, video_id: nil}

    test "list_tracker/0 returns all tracker" do
      tracker = tracker_fixture()
      assert Trackers.list_tracker() == [tracker]
    end

    test "get_tracker!/1 returns the tracker with given id" do
      tracker = tracker_fixture()
      assert Trackers.get_tracker!(tracker.id) == tracker
    end

    test "create_tracker/1 with valid data creates a tracker" do
      valid_attrs = %{activity: "some activity", end_time: 42, old_video_id: "some old_video_id", start_time: 42, track_id: 42, video_id: "some video_id"}

      assert {:ok, %Tracker{} = tracker} = Trackers.create_tracker(valid_attrs)
      assert tracker.activity == "some activity"
      assert tracker.end_time == 42
      assert tracker.old_video_id == "some old_video_id"
      assert tracker.start_time == 42
      assert tracker.track_id == 42
      assert tracker.video_id == "some video_id"
    end

    test "create_tracker/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Trackers.create_tracker(@invalid_attrs)
    end

    test "update_tracker/2 with valid data updates the tracker" do
      tracker = tracker_fixture()
      update_attrs = %{activity: "some updated activity", end_time: 43, old_video_id: "some updated old_video_id", start_time: 43, track_id: 43, video_id: "some updated video_id"}

      assert {:ok, %Tracker{} = tracker} = Trackers.update_tracker(tracker, update_attrs)
      assert tracker.activity == "some updated activity"
      assert tracker.end_time == 43
      assert tracker.old_video_id == "some updated old_video_id"
      assert tracker.start_time == 43
      assert tracker.track_id == 43
      assert tracker.video_id == "some updated video_id"
    end

    test "update_tracker/2 with invalid data returns error changeset" do
      tracker = tracker_fixture()
      assert {:error, %Ecto.Changeset{}} = Trackers.update_tracker(tracker, @invalid_attrs)
      assert tracker == Trackers.get_tracker!(tracker.id)
    end

    test "delete_tracker/1 deletes the tracker" do
      tracker = tracker_fixture()
      assert {:ok, %Tracker{}} = Trackers.delete_tracker(tracker)
      assert_raise Ecto.NoResultsError, fn -> Trackers.get_tracker!(tracker.id) end
    end

    test "change_tracker/1 returns a tracker changeset" do
      tracker = tracker_fixture()
      assert %Ecto.Changeset{} = Trackers.change_tracker(tracker)
    end
  end
end
