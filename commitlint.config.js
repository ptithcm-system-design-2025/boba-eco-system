module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Tiêu đề (header / subject) bắt buộc, không quá dài, không dấu chấm ở cuối
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],           // Không dấu chấm cuối
        'subject-max-length': [2, 'always', 50],          // Thường ≤ 50 ký tự
        'header-trim': [2, 'always'],                     // Không khoảng trắng đầu/cuối

        // Body — nên có dòng trống và không để trống
        'body-leading-blank': [2, 'always'],              // Có dòng trống trước body
        'body-empty': [2, 'never'],                       // Body không được để trống (nếu cần giải thích)
        'body-max-line-length': [2, 'always', 72],        // Wrap tại 72 ký tự
        'body-full-stop': [2, 'never', '.'],              // Không dấu chấm ở cuối mỗi top-level body line (tùy chọn)

        // Footer — kiểm tra Signed-off-by tồn tại
        'footer-leading-blank': [2, 'always'],            // Có dòng trống trước footer
        'signed-off-by': [2, 'always', 'Signed-off-by:'], // Có Signed-off-by
        'trailer-exists': [2, 'always', 'Signed-off-by:'],

        // (Tùy chọn) Các rule khác nếu cần: loại (type) hoặc scope, tuỳ.
    },
};
