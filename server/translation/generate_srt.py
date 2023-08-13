import json
from google.cloud import storage
import os
import shutil
from dotenv import load_dotenv

from msg2srt import msg2srt
from translate_txt import copy_to_local
from txt2srt import txt2srt
from translate_txt import batch_translate_text


def generate_srt(data, target_langs, video_name, output_file="en", input_language="en-US", max_chars=40):

    load_dotenv()
    env = os.getenv('ENVIRONMENT')
    print(f"{env}: Generating SRT files from queue...")
    print(f"Transcript: {data}")

    video_name = video_name.split('.')[0]

    # names for google cloud buckets and project
    INPUT_BUCKET = os.getenv('INPUT_BUCKET')
    OUTPUT_BUCKET = os.getenv('OUTPUT_BUCKET')
    INPUT_URI = os.getenv('INPUT_URI') + output_file + '.txt'
    OUTPUT_URI = os.getenv('OUTPUT_URI')
    PROJECT_ID = os.getenv('PROJECT_ID')
    SUBTITLES = os.getenv('SUBTITLE_BUCKET')

    transcript_srt = f'srts/{output_file}.srt'

    # generate srt from the transcript
    msg2srt(data, max_chars, output_file, input_language)

    # copy srt file to google cloud bucket
    copy_txt(output_file, INPUT_BUCKET, PROJECT_ID)

    # clear the output bucket
    clear_bucket(OUTPUT_BUCKET, PROJECT_ID)

    # translate the srt file into the required languages
    batch_translate_text(INPUT_URI, OUTPUT_URI, PROJECT_ID,
                         input_language, target_lang=target_langs)

    # copy the files from the output bucket to local folders
    copy_to_local("txts", OUTPUT_BUCKET, PROJECT_ID)

    # convert the txt files in the output to vtt files
    txt2srt(transcript_srt, txt_out="txts", srt_out="srts", vtt_out="vtts")

    # in production, save the vtt files to cloud bucket
    if env == "production":
        upload_to_bucket(SUBTITLES, PROJECT_ID, video_name)
    # in development, store the vtt files locally
    elif env == "DEVELOPMENT":
        upload_to_folders("files", video_name)
    
    # clear the intermediate folders
    clear_folders()
    print("Finished writing to srt/vtt files.")


def copy_txt(output_file, bucket_in, project_id):
    """
    Copy the txt file to the google cloud bucket
    """
    storage_client = storage.Client(project_id)
    bucket = storage_client.get_bucket(bucket_in)
    filename = f'{output_file}.txt'
    blob = bucket.blob(filename)
    blob.upload_from_filename(f'txts/{filename}')


def clear_bucket(bucket_out, project_id):
    """ 
    Clear the output bucket.
    Output bucket needs to be cleared before translation starts
    """
    storage_client = storage.Client(project_id)
    blobs = storage_client.list_blobs(bucket_out)
    for blob in blobs:
        blob.delete()


def upload_to_bucket(subtitles, project_id, video_name):
    """
    Upload the vtt files to the google cloud bucket
    """
    storage_client = storage.Client(project_id)
    bucket = storage_client.get_bucket(subtitles)

    for f in os.listdir("vtts"):
        print(f"Uploading vtt file {video_name}-{f}")
        blob = bucket.blob(f'{video_name}-{f}')
        blob.upload_from_filename(f'vtts/{f}')


def clear_folders():
    """
    Clear the intermediate folders
    """
    dirs = ["txts", "srts", "vtts"]
    for dir in dirs:
        for f in os.listdir(dir):
            os.remove(os.path.join(dir, f))


def upload_to_folders(folder_name, video_name):
    """
    Copy the vtt files to the local folders
    """
    for f in os.listdir("vtts"):
        shutil.copyfile(f'vtts/{f}', f'{folder_name}/vtts/{video_name}-{f}')