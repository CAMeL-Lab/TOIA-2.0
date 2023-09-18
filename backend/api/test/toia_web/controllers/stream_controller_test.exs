defmodule ToiaWeb.StreamControllerTest do
  use ToiaWeb.ConnCase

  import Toia.StreamsFixtures

  alias Toia.Streams.Stream

  @create_attrs %{
    likes: 42,
    name: "some name",
    private: true,
    views: 42
  }
  @update_attrs %{
    likes: 43,
    name: "some updated name",
    private: false,
    views: 43
  }
  @invalid_attrs %{likes: nil, name: nil, private: nil, views: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all stream", %{conn: conn} do
      conn = get(conn, ~p"/api/stream")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create stream" do
    test "renders stream when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/stream", stream: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/stream/#{id}")

      assert %{
               "id" => ^id,
               "likes" => 42,
               "name" => "some name",
               "private" => true,
               "views" => 42
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/stream", stream: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update stream" do
    setup [:create_stream]

    test "renders stream when data is valid", %{conn: conn, stream: %Stream{id: id} = stream} do
      conn = put(conn, ~p"/api/stream/#{stream}", stream: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/stream/#{id}")

      assert %{
               "id" => ^id,
               "likes" => 43,
               "name" => "some updated name",
               "private" => false,
               "views" => 43
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, stream: stream} do
      conn = put(conn, ~p"/api/stream/#{stream}", stream: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete stream" do
    setup [:create_stream]

    test "deletes chosen stream", %{conn: conn, stream: stream} do
      conn = delete(conn, ~p"/api/stream/#{stream}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/stream/#{stream}")
      end
    end
  end

  defp create_stream(_) do
    stream = stream_fixture()
    %{stream: stream}
  end
end
