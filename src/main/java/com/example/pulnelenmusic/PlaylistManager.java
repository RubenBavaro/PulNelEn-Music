package com.example.pulnelenmusic;

import java.io.*;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Manages reading and writing of playlists to a text file.
 * Each line in the file is one playlist record in the format:
 *     user;playlistName;songRecord|songRecord|...
 */
public class PlaylistManager {
    private final String filePath;
    private final String newLine = System.lineSeparator(); // Initialize with system line separator

    public PlaylistManager(String filePath) {
        this.filePath = filePath;
        // Ensure the file (and containing directories) exist
        File file = new File(filePath);
        try {
            if (!file.exists()) {
                File parent = file.getParentFile();
                if (parent != null) parent.mkdirs();
                file.createNewFile();
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize playlists file", e);
        }
    }


    /**
     * Appends a new playlist record to playlists.txt
     * (Uses Playlist.toRecord() under the hood, which yields "user;name;...").
     */
    public void addPlaylist(Playlist playlist) throws IOException {
        try (FileWriter fw = new FileWriter(filePath, /* append */ true);
             BufferedWriter bw = new BufferedWriter(fw)) {
            bw.write(playlist.toRecord());
            bw.newLine();
        }
    }

    /**
     * Reads all playlists from the file, reconstructs Playlist objects,
     * and returns only those belonging to the given user.
     */
    public List<Playlist> getUserPlaylists(String user) throws IOException {
        List<Playlist> result = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = br.readLine()) != null) {
                Playlist p = Playlist.fromRecord(line);
                if (p.getUser().equals(user)) {
                    result.add(p);
                }
            }
        }
        return result;
    }


    public List<Song> getDefaultSongs() throws IOException {
        List<Song> defaultSongs = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("default;Default Songs;")) {
                    String[] parts = line.split(";", 3);
                    if (parts.length > 2) {
                        String[] songRecords = parts[2].split("\\|");
                        for (String songRecord : songRecords) {
                            defaultSongs.add(Song.fromRecord(songRecord));
                        }
                    }
                    break;
                }
            }
        }
        return defaultSongs;
    }


    public void createPlaylist(Playlist playlist) throws IOException {
        try (FileWriter writer = new FileWriter(filePath, true)) {
            writer.write(playlist.toRecord() + newLine);
        }
    }

    public void addSongToPlaylist(String user, String plName, Song song) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        boolean found = false;

        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";" + plName + ";")) {
                    if (l.split(";", 3).length > 2 && !l.split(";", 3)[2].isEmpty()) {
                        w.write(l + "|" + song.toRecord() + newLine);
                    } else {
                        w.write(user + ";" + plName + ";" + song.toRecord() + newLine);
                    }
                    found = true;
                } else {
                    w.write(l + newLine);
                }
            }

            if (!found) {
                Playlist playlist = new Playlist(user, plName);
                playlist.addSong(song);
                w.write(playlist.toRecord() + newLine);
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
                if (line.startsWith(user + ";LASTPLAYED;")) {
                    String[] parts = line.split(";", 3);
                    if (parts.length > 2) {
                        return Song.fromRecord(parts[2]);
                    }
                }
            }
        }

        // If no last played song found, return a random song from default songs
        List<Song> defaultSongs = getDefaultSongs();
        if (!defaultSongs.isEmpty()) {
            Random random = new Random();
            return defaultSongs.get(random.nextInt(defaultSongs.size()));
        }

        return null;
    }

    public void updateLastPlayed(String user, Song song) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        boolean found = false;

        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";LASTPLAYED;")) {
                    w.write(user + ";LASTPLAYED;" + song.toRecord() + newLine);
                    found = true;
                } else {
                    w.write(l + newLine);
                }
            }

            if (!found) {
                w.write(user + ";LASTPLAYED;" + song.toRecord() + newLine);
            }
        }
    }
}