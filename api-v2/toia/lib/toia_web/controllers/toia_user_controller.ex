defmodule ToiaWeb.ToiaUserController do
  use ToiaWeb, :controller

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.ToiaUsers
  alias Toia.ToiaUsers.ToiaUser
  alias Toia.Streams.Stream

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    toia_user = ToiaUsers.list_toia_user()
    render(conn, :index, toia_user: toia_user)
  end

  def create(conn, toia_user_params) do
    with {:ok, %ToiaUser{} = toia_user, _stream} <- ToiaUsers.create_toia_user_with_stream(toia_user_params) do
      with {:ok, token, _claims} <- Toia.Guardian.encode_and_sign(toia_user) do
        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/api/toia_user/#{toia_user}")
        |> render(:show, toia_user: toia_user, token: token)
      else
        {:error, :secret_not_found} ->
          IO.warn "Guardian Secret not found in the environment"
          conn
          |> put_status(:internal_server_error)
          |> json(%{error: "Internal server error"})

        {:error, :reason} ->
          IO.inspect(:reason)
          conn
          |> put_status(:internal_server_error)
          |> json(%{error: "Internal server error"})
      end
    else
      {:error_pic, reason} ->
        IO.warn("Photo couldn't be uploaded")
        IO.warn(reason)
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Photo couldn't be uploaded"})
      _ ->
        IO.inspect("Something went wrong")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Internal server error"})
    end
  end

  def show(conn, %{"id" => id}) do
    toia_user = ToiaUsers.get_toia_user!(id)
    render(conn, :show, toia_user: toia_user)
  end

  def update(conn, %{"id" => id, "toia_user" => toia_user_params}) do
    toia_user = ToiaUsers.get_toia_user!(id)

    with {:ok, %ToiaUser{} = toia_user} <- ToiaUsers.update_toia_user(toia_user, toia_user_params) do
      render(conn, :show, toia_user: toia_user)
    end
  end

  def delete(conn, %{"id" => id}) do
    toia_user = ToiaUsers.get_toia_user!(id)

    with {:ok, %ToiaUser{}} <- ToiaUsers.delete_toia_user(toia_user) do
      send_resp(conn, :no_content, "")
    end
  end

  def list_stream(user_id) do
    query = from s in Stream, where: s.toia_id == ^user_id
    Repo.all(query)
  end

  def list_public_stream(user_id) do
    query = from s in Stream, where: s.toia_id == ^user_id and s.private == false
    Repo.all(query)
  end

  def streams(%{assigns: %{current_user: user}} = conn, %{"user_id" => other_user_idStr}) do
    {other_user_id, _} = Integer.parse(other_user_idStr)
    if user.id == other_user_id do
      streams = list_stream(user.id)

      conn
      |> put_view(ToiaWeb.StreamJSON)
      |> render(:index, stream: streams)
    else
      streams = list_public_stream(other_user_id)

      conn
      |> put_view(ToiaWeb.StreamJSON)
      |> render(:index, stream: streams)
    end
  end
end
