package com.example.pulnelenmusic;

public class Song {
    private String title;
    private String artist;
    private String genre;
    private String filePath;
    private String coverPath;

    public Song(String title, String artist, String genre, String filePath, String coverPath) {
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.filePath = filePath;
        this.coverPath = coverPath;
    }

    public Song(String title, String artist, String genre) {
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.filePath = null;
        this.coverPath = null;
    }

    public String getTitle() {
        return title;
    }

    public String getArtist() {
        return artist;
    }

    public String getGenre() {
        return genre;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getCoverPath() {
        return coverPath;
    }

    public void setCoverPath(String coverPath) {
        this.coverPath = coverPath;
    }

    public String toRecord() {
        // Format: title§artist§genre§filePath§coverPath
        StringBuilder sb = new StringBuilder();
        sb.append(title == null ? "" : title).append("§");
        sb.append(artist == null ? "" : artist).append("§");
        sb.append(genre == null ? "" : genre).append("§");
        sb.append(filePath == null ? "" : filePath).append("§");
        sb.append(coverPath == null ? "" : coverPath);
        return sb.toString();
    }



    public String toJSON() {
        return String.format(
                "{\"title\":\"%s\",\"artist\":\"%s\",\"genre\":\"%s\",\"filePath\":\"%s\",\"coverPath\":\"%s\"}",
                title.replace("\"", "\\\""),
                artist.replace("\"", "\\\""),
                genre.replace("\"", "\\\""),
                filePath.replace("\"", "\\\""),
                coverPath.replace("\"", "\\\"")
        );
    }


    public static Song fromRecord(String record) {
        String[] parts = record.split("§", 5);

        String title = parts.length > 0 ? parts[0] : "";
        String artist = parts.length > 1 ? parts[1] : "";
        String genre = parts.length > 2 ? parts[2] : "";

        Song song = new Song(title, artist, genre);

        if (parts.length > 3) {
            song.setFilePath(parts[3].isEmpty() ? null : parts[3]);
        }

        if (parts.length > 4) {
            song.setCoverPath(parts[4].isEmpty() ? null : parts[4]);
        }

        return song;
    }
}

