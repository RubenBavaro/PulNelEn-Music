package com.example.pulnelenmusic;

import java.io.*;
import java.nio.file.Files;
import java.util.*;

public class PlaylistManager {
    private final String filePath;
    private String newLine = System.lineSeparator();

    public PlaylistManager(String filePath) { this.filePath = filePath; }

    public List<Playlist> getUserPlaylists(String user) throws IOException {
        List<Playlist> list = new ArrayList<>();
        try (BufferedReader r = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (line.startsWith(user + ";")) {
                    list.add(Playlist.fromRecord(line));
                }
            }
        }
        return list;
    }

    public void addSongToPlaylist(String user, String plName, Song song) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";" + plName + ";")) {
                    w.write(l + "|" + song.toRecord() + newLine);
                } else {
                    w.write(l + newLine);
                }
            }
        }
    }

    public void removeSongFromPlaylist(String user, String plName, String title) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";" + plName + ";")) {
                    Playlist p = Playlist.fromRecord(l);
                    p.removeSong(title);
                    w.write(p.toRecord() + newLine);
                } else {
                    w.write(l + newLine);
                }
            }
        }
    }

    public Song getLastPlayed(String user) throws IOException {
        try (BufferedReader r = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (line.startsWith(user + ";")) {
                    return Song.fromRecord(line.split(";", 2)[1]);
                }
            }
        }
        return null;
    }

    public void updateLastPlayed(String user, Song song) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        boolean found = false;
        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";")) {
                    w.write(user + ";" + song.toRecord() + newLine);
                    found = true;
                } else {
                    w.write(l + newLine);
                }
            }
            if (!found) {
                w.write(user + ";" + song.toRecord() + newLine);
            }
        }
    }
}
