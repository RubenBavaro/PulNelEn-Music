package com.example.pulnelenmusic;

import java.util.*;
import java.util.stream.*;

public class Playlist {
    private String username, name;
    private List<Song> songs;
    public Playlist(String u, String n, List<Song> s) { username = u; name = n; songs = s; }

    public String getName() { return name; }
    public List<Song> getSongs() { return songs; }

    public void removeSong(String title) {
        songs.removeIf(s -> s.getTitle().equals(title));
    }

    public String toRecord() {
        String songPart = songs.stream()
                .map(Song::toRecord)
                .collect(Collectors.joining("|"));
        return username + ";" + name + ";" + songPart;
    }

    public static Playlist fromRecord(String rec) {
        String[] parts = rec.split(";", 3);
        String user = parts[0], plName = parts[1];
        List<Song> list = new ArrayList<>();
        if (parts.length > 2 && !parts[2].isEmpty()) {
            for (String sr : parts[2].split("\\|")) {
                list.add(Song.fromRecord(sr));
            }
        }
        return new Playlist(user, plName, list);
    }
}
