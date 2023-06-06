defmodule Toia.VideosTest do
  use Toia.DataCase

  alias Toia.Videos

  describe "video" do
    alias Toia.Videos.Video

    import Toia.VideosFixtures

    @invalid_attrs %{
      answer: nil,
      duration_seconds: nil,
      idx: nil,
      language: nil,
      likes: nil,
      private: nil,
      views: nil
    }

    test "list_video/0 returns all video" do
      video = video_fixture()
      assert Videos.list_video() == [video]
    end

    test "get_video!/1 returns the video with given id" do
      video = video_fixture()
      assert Videos.get_video!(video.id) == video
    end

    test "create_video/1 with valid data creates a video" do
      valid_attrs = %{
        answer: "some answer",
        duration_seconds: 42,
        idx: 42,
        language: "some language",
        likes: 42,
        private: true,
        views: 42
      }

      assert {:ok, %Video{} = video} = Videos.create_video(valid_attrs)
      assert video.answer == "some answer"
      assert video.duration_seconds == 42
      assert video.idx == 42
      assert video.language == "some language"
      assert video.likes == 42
      assert video.private == true
      assert video.views == 42
    end

    test "create_video/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Videos.create_video(@invalid_attrs)
    end

    test "update_video/2 with valid data updates the video" do
      video = video_fixture()

      update_attrs = %{
        answer: "some updated answer",
        duration_seconds: 43,
        idx: 43,
        language: "some updated language",
        likes: 43,
        private: false,
        views: 43
      }

      assert {:ok, %Video{} = video} = Videos.update_video(video, update_attrs)
      assert video.answer == "some updated answer"
      assert video.duration_seconds == 43
      assert video.idx == 43
      assert video.language == "some updated language"
      assert video.likes == 43
      assert video.private == false
      assert video.views == 43
    end

    test "update_video/2 with invalid data returns error changeset" do
      video = video_fixture()
      assert {:error, %Ecto.Changeset{}} = Videos.update_video(video, @invalid_attrs)
      assert video == Videos.get_video!(video.id)
    end

    test "delete_video/1 deletes the video" do
      video = video_fixture()
      assert {:ok, %Video{}} = Videos.delete_video(video)
      assert_raise Ecto.NoResultsError, fn -> Videos.get_video!(video.id) end
    end

    test "change_video/1 returns a video changeset" do
      video = video_fixture()
      assert %Ecto.Changeset{} = Videos.change_video(video)
    end
  end
end
