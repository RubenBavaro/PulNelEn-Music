package com.example.pulnelenmusic;

import java.util.ArrayList;
import java.util.List;

public class Playlist {
    private String user;
    private String name;
    private List<Song> songs;

    public Playlist(String user, String name) {
        this.user = user;
        this.name = name;
        this.songs = new ArrayList<>();
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Song> getSongs() {
        return songs;
    }

    public void setSongs(List<Song> songs) {
        this.songs = songs;
    }

    public void addSong(Song song) {
        this.songs.add(song);
    }

    public void removeSong(String title) {
        songs.removeIf(song -> song.getTitle().equals(title));
    }

    public String toRecord() {
        StringBuilder sb = new StringBuilder();
        sb.append(user).append(";").append(name).append(";");

        if (!songs.isEmpty()) {
            for (int i = 0; i < songs.size(); i++) {
                sb.append(songs.get(i).toRecord());
                if (i < songs.size() - 1) {
                    sb.append("|");
                }
            }
        }

        return sb.toString();
    }

    public static Playlist fromRecord(String record) {
        String[] parts = record.split(";", 3);
        if (parts.length < 2) {
            return new Playlist("unknown", "unknown");
        }

        Playlist playlist = new Playlist(parts[0], parts[1]);

        if (parts.length > 2 && !parts[2].isEmpty()) {
            String[] songRecords = parts[2].split("\\|");
            for (String songRecord : songRecords) {
                if (!songRecord.trim().isEmpty()) {
                    playlist.addSong(Song.fromRecord(songRecord));
                }
            }
        }

        return playlist;
    }
}