defmodule ToiaWeb.TrackerController do
  use ToiaWeb, :controller

  alias Toia.Trackers
  alias Toia.Trackers.Tracker

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    tracker = Trackers.list_tracker()
    render(conn, :index, tracker: tracker)
  end

  def create(conn, %{"tracker" => tracker_params}) do
    with {:ok, %Tracker{} = tracker} <- Trackers.create_tracker(tracker_params) do
      conn
      |> put_status(:created)
      |> render(:show, tracker: tracker)
    end
  end

  def show(conn, %{"id" => id}) do
    tracker = Trackers.get_tracker!(id)
    render(conn, :show, tracker: tracker)
  end

  def update(conn, %{"id" => id, "tracker" => tracker_params}) do
    tracker = Trackers.get_tracker!(id)

    with {:ok, %Tracker{} = tracker} <- Trackers.update_tracker(tracker, tracker_params) do
      render(conn, :show, tracker: tracker)
    end
  end

  def delete(conn, %{"id" => id}) do
    tracker = Trackers.get_tracker!(id)

    with {:ok, %Tracker{}} <- Trackers.delete_tracker(tracker) do
      send_resp(conn, :no_content, "")
    end
  end
end
