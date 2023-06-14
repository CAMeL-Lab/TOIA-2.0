defmodule Toia.QuestionsTest do
  use Toia.DataCase

  alias Toia.Questions

  describe "questions" do
    alias Toia.Questions.Question

    import Toia.QuestionsFixtures

    @invalid_attrs %{
      onboarding: nil,
      priority: nil,
      question: nil,
      suggested_type: nil,
      trigger_suggester: nil
    }

    test "list_questions/0 returns all questions" do
      question = question_fixture()
      assert Questions.list_questions() == [question]
    end

    test "get_question!/1 returns the question with given id" do
      question = question_fixture()
      assert Questions.get_question!(question.id) == question
    end

    test "create_question/1 with valid data creates a question" do
      valid_attrs = %{
        onboarding: true,
        priority: 42,
        question: "some question",
        suggested_type: :filler,
        trigger_suggester: true
      }

      assert {:ok, %Question{} = question} = Questions.create_question(valid_attrs)
      assert question.onboarding == true
      assert question.priority == 42
      assert question.question == "some question"
      assert question.suggested_type == :filler
      assert question.trigger_suggester == true
    end

    test "create_question/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Questions.create_question(@invalid_attrs)
    end

    test "update_question/2 with valid data updates the question" do
      question = question_fixture()

      update_attrs = %{
        onboarding: false,
        priority: 43,
        question: "some updated question",
        suggested_type: :greeting,
        trigger_suggester: false
      }

      assert {:ok, %Question{} = question} = Questions.update_question(question, update_attrs)
      assert question.onboarding == false
      assert question.priority == 43
      assert question.question == "some updated question"
      assert question.suggested_type == :greeting
      assert question.trigger_suggester == false
    end

    test "update_question/2 with invalid data returns error changeset" do
      question = question_fixture()
      assert {:error, %Ecto.Changeset{}} = Questions.update_question(question, @invalid_attrs)
      assert question == Questions.get_question!(question.id)
    end

    test "delete_question/1 deletes the question" do
      question = question_fixture()
      assert {:ok, %Question{}} = Questions.delete_question(question)
      assert_raise Ecto.NoResultsError, fn -> Questions.get_question!(question.id) end
    end

    test "change_question/1 returns a question changeset" do
      question = question_fixture()
      assert %Ecto.Changeset{} = Questions.change_question(question)
    end
  end
end
