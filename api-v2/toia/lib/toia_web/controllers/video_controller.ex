defmodule ToiaWeb.VideoController do
  use ToiaWeb, :controller

  alias Toia.Videos
  alias Toia.Videos.Video

  action_fallback ToiaWeb.FallbackController

  def index(%{assigns: %{current_user: user}} = conn, _params) do
    video = Videos.list_video(user.id)
    render(conn, :index, video: video)
  end

  def create(conn, %{"video" => video_params}) do
    with {:ok, %Video{} = video} <- Videos.create_video(video_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/video/#{video}")
      |> render(:show, video: video)
    end
  end

  def show(%{assigns: %{current_user: user}} = conn, %{"id" => id} = _video_params) do
    video = Videos.get_video!(id)

    case Videos.canAccess(user, video) do
      true ->
        playbackUrl = Videos.getPlaybackUrl(user.first_name, user.id, video.id_video)
        video = Map.put(video, :videoURL, playbackUrl)
        IO.inspect(video)
        render(conn, :show, video: video)

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
    end
  end

  def update(conn, %{"id" => id, "video" => video_params}) do
    video = Videos.get_video!(id)

    with {:ok, %Video{} = video} <- Videos.update_video(video, video_params) do
      render(conn, :show, video: video)
    end
  end

  def delete(conn, %{"id" => id}) do
    video = Videos.get_video!(id)

    with {:ok, %Video{}} <- Videos.delete_video(video) do
      send_resp(conn, :no_content, "")
    end
  end
end
