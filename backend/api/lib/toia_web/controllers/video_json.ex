defmodule ToiaWeb.VideoJSON do
  alias Toia.Videos.Video

  @doc """
  Renders a list of video.
  """
  def index(%{video: video}) do
    %{data: for(video <- video, do: data(video))}
  end

  @doc """
  Renders a single video.
  """
  def show(%{video: video}) do
    %{data: data(video)}
  end

  defp data(%{videoURL: _} = video) do
    %{
      id_video: video.id_video,
      idx: video.idx,
      private: video.private,
      answer: video.answer,
      language: video.language,
      likes: video.likes,
      views: video.views,
      duration_seconds: video.duration_seconds,
      toia_id: video.toia_id,
      videoURL: video.videoURL
    }
  end

  defp data(%Video{} = video) do
    %{
      id_video: video.id_video,
      idx: video.idx,
      private: video.private,
      answer: video.answer,
      language: video.language,
      likes: video.likes,
      views: video.views,
      duration_seconds: video.duration_seconds,
      toia_id: video.toia_id
    }
  end
end
