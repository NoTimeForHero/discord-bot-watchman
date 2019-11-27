class FakeI18N {
    __() {
        const data = [...arguments].join(' ').trimRight();
        console.log('FakeI18N: ' + data);
        return data;
    }
}

module.exports = FakeI18N;