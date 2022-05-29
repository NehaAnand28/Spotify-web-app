from flask import Flask, send_from_directory
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS #comment this on deployment
from api.GetRecommendations import GetRecommendations
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.oauth2 import SpotifyClientCredentials
import spotipy.util as util
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import linear_kernel, cosine_similarity
import numpy as np
from flask import request
from dotenv import load_dotenv
import os
import spotifyPlaylist


app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app) #comment this on deployment
api = Api(app)

@app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder,'index.html')

api.add_resource(GetRecommendations, '/flask/models')

# ----------------------------------------------------------------------------


load_dotenv()

client_id = os.environ.get('CLIENT_ID')
client_secret = os.environ.get('CLIENT_SECRET')
username = os.environ.get('USERNAME')

#extended the scope to also modify non-public playlists
scope = "playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative"

redirect_uri = "http://localhost:8888/callback"

client_credentials_manager = SpotifyClientCredentials(client_id=client_id, 
                                                      client_secret=client_secret)

# creating spotipy object
sp = spotipy.Spotify(client_credentials_manager = client_credentials_manager)
# receiving access token for session management
token = util.prompt_for_user_token(username, scope, client_id, client_secret, redirect_uri)
if token:
    sp = spotipy.Spotify(auth=token)
else:
    print("Can't get token for", username)

# ----------------------------------------------------------------------------------

@app.route('/create', methods=['GET','POST'])
def create():
    playlist_name = "Recommended for you"
    playlist_description = "Recommended based on a existing playlist"
    sp.user_playlist_create(user=username, name=playlist_name, public=True, collaborative=False, description=playlist_description)
    return "created"

@app.route('/generate',methods=['GET','POST'])
def create_df_saved_songs(api_results):
    """
    Reads in the spotipy query results for user saved songs and returns a DataFrame with
    track_name,track_id, artist,album,duration,popularity
    Parameters
    ----------
    api_results : the results of a query to spotify with .current_user_saved_tracks()
    Returns
    -------
    df: DataFrame containing track_name,track_id, artist,album,duration,popularity
    """

    track_name = []
    track_id = []
    artist = []
    album = []
    duration = []
    popularity = []
    #loop through api_results
    for items in api_results["items"]:
        try:
            track_name.append(items["track"]['name'])
            track_id.append(items["track"]['id'])
            artist.append(items["track"]["artists"][0]["name"])
            duration.append(items["track"]["duration_ms"])
            album.append(items["track"]["album"]["name"])
            popularity.append(items["track"]["popularity"])
        except TypeError: 
            pass
    # Create the final df   
    df = pd.DataFrame({ "track_name": track_name, 
                             "album": album, 
                             "track_id": track_id,
                             "artist": artist, 
                             "duration": duration, 
                             "popularity": popularity})
    return df


def create_df_recommendations(api_results):
    """
    Reads in the spotipy query results for spotify recommended songs and returns a 
    DataFrame with track_name,track_id,artist,album,duration,popularity
    Parameters
    ----------
    api_results : the results of a query to spotify with .recommendations()
    Returns
    -------
    df: DataFrame containing track_name, track_id, artist, album, duration, popularity
    """
    track_name = []
    track_id = []
    artist = []
    album = []
    duration = []
    popularity = []
    for items in api_results['tracks']:
        try:
            track_name.append(items['name'])
            track_id.append(items['id'])
            artist.append(items["artists"][0]["name"])
            duration.append(items["duration_ms"])
            album.append(items["album"]["name"])
            popularity.append(items["popularity"])
        except TypeError:
            pass
        df = pd.DataFrame({ "track_name": track_name, 
                                "album": album, 
                                "track_id": track_id,
                                "artist": artist, 
                                "duration": duration, 
                                "popularity": popularity})

    return df


def create_df_playlist(api_results,sp = None, append_audio = True):
    """
    Reads in the spotipy query results for a playlist and returns a 
    DataFrame with track_name,track_id,artist,album,duration,popularity
    and audio_features unless specified otherwise.
    Parameters
    ----------
    api_results : the results of a query to spotify with .recommendations()
    sp : spotfiy authentication token (result of authenticate())
    append_audio : argument to choose whether to append audio features
    Returns
    -------
    df: DataFrame containing track_name, track_id, artist, album, duration, popularity
    """
    df = create_df_saved_songs(api_results["tracks"])
    if append_audio == True:
        assert sp != None, "sp needs to be specified for appending audio features"
        df = append_audio_features(df,sp)
    return df
    
def append_audio_features(df,spotify_auth, return_feat_df = False):
    """ 
    Fetches the audio features for all songs in a DataFrame and
    appends these as rows to the DataFrame.
    Requires spotipy to be set up with an auth token.
    Parameters
    ----------
    df : Dataframe containing at least track_name and track_id for spotify songs
    spotify_auth: spotfiy authentication token (result of authenticate())
    return_feat_df: argument to choose whether to also return df with just the audio features
    
    Returns
    -------
    df: DataFrame containing all original rows and audio features for each song
    df_features(optional): DataFrame containing just the audio features
    """
    audio_features = spotify_auth.audio_features(df["track_id"][:])
    assert len(audio_features) == len(df["track_id"][:])
    feature_cols = list(audio_features[0].keys())[:-7]
    features_list = []
    for features in audio_features:
        try:
            song_features = [features[col] for col in feature_cols]
            features_list.append(song_features)
        except TypeError:
            pass
    df_features = pd.DataFrame(features_list,columns = feature_cols)
    df = pd.concat([df,df_features],axis = 1)
    if return_feat_df == False:
        return df
    else:
        return df,df_features

# spotify:playlist:37i9dQZF1E4s96jJgqDgvl -- structure of a playlist URI

#get the playlist data from the API
playlist_uri = "spotify:playlist:37i9dQZF1E4s96jJgqDgvl" #generates recommendation based on this playlist
api_playlist = sp.playlist(playlist_uri)
playlist_df = create_df_playlist(api_playlist,sp = sp)

#get seed tracks for recommendations
seed_tracks = playlist_df["track_id"].tolist()

#create recommendation df from multiple recommendations
recomm_dfs = []
for i in range(5,len(seed_tracks)+1,5):
    recomms = sp.recommendations(seed_tracks = seed_tracks[i-5:i],limit = 25)
    recomms_df = append_audio_features(create_df_recommendations(recomms),sp)
    recomm_dfs.append(recomms_df)
recomms_df = pd.concat(recomm_dfs)
recomms_df.reset_index(drop = True, inplace = True)


def create_similarity_score(df1,df2,similarity_score = "cosine_sim"):
    """ 
    Creates a similarity matrix for the audio features (except key and mode) of two Dataframes.
    Parameters
    ----------
    df1 : DataFrame containing track_name,track_id, artist,album,duration,popularity
            and all audio features
    df2 : DataFrame containing track_name,track_id, artist,album,duration,popularity
            and all audio features
    
    similarity_score: similarity measure (linear,cosine_sim)
    Returns
    -------
    A matrix of similarity scores for the audio features of both DataFrames.
    """
    
    assert list(df1.columns[6:]) == list(df2.columns[6:]), "dataframes need to contain the same columns"
    features = list(df1.columns[6:])
    features.remove('key')
    features.remove('mode')
    df_features1,df_features2 = df1[features],df2[features]
    scaler = MinMaxScaler() #StandardScaler() not used anymore
    df_features_scaled1,df_features_scaled2 = scaler.fit_transform(df_features1),scaler.fit_transform(df_features2)
    if similarity_score == "linear":
        linear_sim = linear_kernel(df_features_scaled1, df_features_scaled2)
        return linear_sim
    elif similarity_score == "cosine_sim":
        cosine_sim = cosine_similarity(df_features_scaled1, df_features_scaled2)
        return cosine_sim

        
#create similarity scoring between playlist and recommendations
similarity_score = create_similarity_score(playlist_df,recomms_df)
#get a filtered recommendations df
final_recomms = recomms_df.iloc[[np.argmax(i) for i in similarity_score]]
final_recomms = final_recomms.drop_duplicates()
#filter again so tracks are not already in playlist_df
final_recomms = final_recomms[~final_recomms["track_name"].isin(playlist_df["track_name"])]
final_recomms.reset_index(drop = True, inplace = True)

# newly generated playlist - "Recommended for you"
new_playlist_uri = "spotify:playlist:7s3AtNb0SVYC15SzSR29oJ"

sp.user_playlist_add_tracks(username,playlist_id = new_playlist_uri,tracks = final_recomms["track_id"].tolist())

